import { JobService } from '../job.service';
import prisma from '../../config/database';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    job: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('JobService', () => {
  let jobService: JobService;

  beforeEach(() => {
    jobService = new JobService();
    jest.clearAllMocks();
  });

  describe('createJob', () => {
    it('should create a new job successfully', async () => {
      const mockJob = {
        id: '1',
        title: 'Software Engineer',
        description: 'Great opportunity',
        department: 'Engineering',
        location: 'Remote',
        type: 'FULL_TIME',
        status: 'OPEN',
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.job.create as jest.Mock).mockResolvedValue(mockJob);

      const result = await jobService.createJob(
        {
          title: 'Software Engineer',
          description: 'Great opportunity',
          department: 'Engineering',
          location: 'Remote',
          type: 'FULL_TIME',
        },
        'user1'
      );

      expect(result).toEqual(mockJob);
      expect(prisma.job.create).toHaveBeenCalled();
    });
  });

  describe('getAllJobs', () => {
    it('should return all jobs', async () => {
      const mockJobs = [
        { id: '1', title: 'Job 1' },
        { id: '2', title: 'Job 2' },
      ];

      (prisma.job.findMany as jest.Mock).mockResolvedValue(mockJobs);

      const result = await jobService.getAllJobs();

      expect(result).toEqual(mockJobs);
      expect(prisma.job.findMany).toHaveBeenCalled();
    });

    it('should filter jobs by status', async () => {
      const mockJobs = [{ id: '1', title: 'Job 1', status: 'OPEN' }];

      (prisma.job.findMany as jest.Mock).mockResolvedValue(mockJobs);

      await jobService.getAllJobs({ status: 'OPEN' });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'OPEN' }),
        })
      );
    });
  });

  describe('getJobById', () => {
    it('should return a job by id', async () => {
      const mockJob = { id: '1', title: 'Job 1' };

      (prisma.job.findUnique as jest.Mock).mockResolvedValue(mockJob);

      const result = await jobService.getJobById('1');

      expect(result).toEqual(mockJob);
    });

    it('should throw error if job not found', async () => {
      (prisma.job.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(jobService.getJobById('999')).rejects.toThrow('Job not found');
    });
  });
});

