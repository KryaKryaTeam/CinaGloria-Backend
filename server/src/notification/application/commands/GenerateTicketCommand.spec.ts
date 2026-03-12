import { Test, TestingModule } from '@nestjs/testing';
import { GenerateTicketCommand } from './GenerateTicketCommand';
import { BaseTokens, ServiceTokens } from 'src/common/Tokens';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';

describe('GenerateTicketCommand', () => {
  let command: GenerateTicketCommand;

  // Mock for the TicketService
  const mockTicketService = {
    generate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateTicketCommand,
        {
          provide: ServiceTokens.WsTicketService,
          useValue: mockTicketService,
        },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: createMockEventDispatcher(),
        },
        {
          provide: BaseTokens.DBContext,
          useValue: createMockDBContext(),
        },
      ],
    }).compile();

    command = module.get<GenerateTicketCommand>(GenerateTicketCommand);
    jest.clearAllMocks();
  });

  it('should call ticketService.generate with the provided userId and return the ticket', () => {
    // Arrange
    const userId = 'user-uuid-123';
    const expectedTicket = 'generated-ws-ticket-abc';
    mockTicketService.generate.mockReturnValue(expectedTicket);

    // Act
    const result = command.implementation(userId);

    // Assert
    expect(mockTicketService.generate).toHaveBeenCalledWith(userId);
    expect(mockTicketService.generate).toHaveBeenCalledTimes(1);
    expect(result).toBe(expectedTicket);
  });

  it('should propagate errors if the ticket service fails', () => {
    // Arrange
    const userId = 'user-uuid-123';
    mockTicketService.generate.mockImplementation(() => {
      throw new Error('Service Unavailable');
    });

    // Act & Assert
    expect(() => command.implementation(userId)).toThrow('Service Unavailable');
  });
});
