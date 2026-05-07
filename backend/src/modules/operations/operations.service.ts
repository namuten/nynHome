import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execPromise = promisify(exec);
const prisma = new PrismaClient();

export interface SystemHealthResponse {
  database: 'ok' | 'error';
  storage: 'ok' | 'error';
  uptimeSeconds: number;
  version: string;
}

export const operationsService = {
  /**
   * Fetch paginated list of backup logs
   */
  getBackupRuns: async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      prisma.backupRun.findMany({
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.backupRun.count(),
    ]);

    // Format BigInt sizes to numbers for JSON compatibility
    const formattedItems = items.map(item => ({
      ...item,
      sizeBytes: item.sizeBytes ? Number(item.sizeBytes) : null,
    }));

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Query database probe and compute runtime stats for health status checking
   */
  getSystemHealth: async (): Promise<SystemHealthResponse> => {
    let dbStatus: 'ok' | 'error' = 'ok';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      console.error('System Health check database error:', err);
      dbStatus = 'error';
    }

    // Verify storage directory health by checking backend writable permissions
    let storageStatus: 'ok' | 'error' = 'ok';
    try {
      const tempPath = path.join(process.cwd(), '.healthcheck_temp');
      fs.writeFileSync(tempPath, 'health');
      fs.unlinkSync(tempPath);
    } catch (err) {
      console.error('System Health check storage write error:', err);
      storageStatus = 'error';
    }

    // Fetch git commit hash if available
    let gitVersion = '1.0.0';
    try {
      const { stdout } = await execPromise('git rev-parse --short HEAD');
      gitVersion = stdout.trim();
    } catch {
      // Fallback
    }

    return {
      database: dbStatus,
      storage: storageStatus,
      uptimeSeconds: Math.floor(process.uptime()),
      version: gitVersion,
    };
  },

  /**
   * Run the database backup script asynchronously in the background
   */
  triggerBackupRun: async () => {
    const backupRecord = await prisma.backupRun.create({
      data: {
        backupType: 'DATABASE',
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // Execute backup-db.sh in background without blocking the HTTP request
    const scriptPath = path.join(process.cwd(), 'scripts', 'backup-db.sh');
    const backupDir = path.join(process.cwd(), 'backups');

    // Make sure backups folder exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log(`[INFO] Async Backup Run #${backupRecord.id} started using: ${scriptPath}`);

    if (process.env.NODE_ENV === 'test') {
      // Prevent running background mysqldump process in testing environment to avoid test database race conditions
      return {
        ...backupRecord,
        sizeBytes: null,
      };
    }

    // Trigger execution
    exec(`bash "${scriptPath}" "${backupDir}"`, async (error, stdout, stderr) => {
      const finishedAt = new Date();
      if (error) {
        console.error(`[ERROR] Backup script failed for Run #${backupRecord.id}:`, error);
        await prisma.backupRun.update({
          where: { id: backupRecord.id },
          data: {
            status: 'FAILED',
            finishedAt,
            errorMessage: `${error.message}\nStderr: ${stderr}`,
          },
        });
        return;
      }

      console.log(`[INFO] Backup script stdout for Run #${backupRecord.id}:\n`, stdout);

      // Extract filename and size details from stdout or check backups directory for the newest file
      try {
        const files = fs.readdirSync(backupDir)
          .filter(f => f.startsWith('crochub_backup_') && f.endsWith('.sql.gz'))
          .map(f => {
            const filePath = path.join(backupDir, f);
            const stat = fs.statSync(filePath);
            return { name: f, path: filePath, mtime: stat.mtime.getTime(), size: stat.size };
          })
          .sort((a, b) => b.mtime - a.mtime); // Newest first

        if (files.length > 0) {
          const newestFile = files[0];
          // Try reading md5 checksum
          let checksum: string | null = null;
          const md5Path = `${newestFile.path}.md5`;
          if (fs.existsSync(md5Path)) {
            const rawChecksum = fs.readFileSync(md5Path, 'utf8').trim();
            // md5 output format could be "checksum filename" or "MD5(file)=checksum"
            checksum = rawChecksum.split(' ')[0] || rawChecksum;
          }

          await prisma.backupRun.update({
            where: { id: backupRecord.id },
            data: {
              status: 'SUCCESS',
              finishedAt,
              fileUrl: `/backups/${newestFile.name}`,
              sizeBytes: BigInt(newestFile.size),
              checksum,
            },
          });
          console.log(`[INFO] Backup Run #${backupRecord.id} completed successfully!`);
        } else {
          throw new Error('No backup archive (.sql.gz) found in backups directory after script execution.');
        }
      } catch (err: any) {
        console.error(`[ERROR] Failed compiling backup metadata for Run #${backupRecord.id}:`, err);
        await prisma.backupRun.update({
          where: { id: backupRecord.id },
          data: {
            status: 'FAILED',
            finishedAt,
            errorMessage: `Metadata compilation failed: ${err.message}`,
          },
        });
      }
    });

    // Return the initial RUNNING record immediately
    return {
      ...backupRecord,
      sizeBytes: null,
    };
  },
};
