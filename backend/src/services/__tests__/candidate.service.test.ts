import { CandidateService } from '../candidate.service';
import prisma from '../../config/database';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    candidate: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('CandidateService', () => {
  let candidateService: CandidateService;

  beforeEach(() => {
    candidateService = new CandidateService();
    jest.clearAllMocks();
  });

  describe('createCandidate', () => {
    it('should create a new candidate successfully', async () => {
      const mockCandidate = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        skills: ['JavaScript', 'React'],
        experience: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.candidate.create as jest.Mock).mockResolvedValue(mockCandidate);

      const result = await candidateService.createCandidate({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        skills: ['JavaScript', 'React'],
        experience: 5,
      });

      expect(result).toEqual(mockCandidate);
      expect(prisma.candidate.create).toHaveBeenCalled();
    });
  });

  describe('getAllCandidates', () => {
    it('should return all candidates', async () => {
      const mockCandidates = [
        { id: '1', firstName: 'John', lastName: 'Doe' },
        { id: '2', firstName: 'Jane', lastName: 'Smith' },
      ];

      (prisma.candidate.findMany as jest.Mock).mockResolvedValue(mockCandidates);

      const result = await candidateService.getAllCandidates();

      expect(result).toEqual(mockCandidates);
      expect(prisma.candidate.findMany).toHaveBeenCalled();
    });
  });

  describe('getCandidateById', () => {
    it('should return a candidate by id', async () => {
      const mockCandidate = { id: '1', firstName: 'John', lastName: 'Doe' };

      (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(mockCandidate);

      const result = await candidateService.getCandidateById('1');

      expect(result).toEqual(mockCandidate);
    });

    it('should throw error if candidate not found', async () => {
      (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(candidateService.getCandidateById('999')).rejects.toThrow(
        'Candidate not found'
      );
    });
  });
});

