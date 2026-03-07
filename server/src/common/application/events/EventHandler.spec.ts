import { Test, TestingModule } from '@nestjs/testing';
import { EventHandler } from './EventHandler';
import { Event } from 'src/common/domain/Event';
import { EventType } from 'src/common/domain/EventType';
import { BaseTokens } from 'src/common/Tokens';

describe('EventHandler', () => {
  let handler: EventHandler;

  // Мокаємо DBContext
  const mockDbContext = {
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventHandler,
        {
          provide: BaseTokens.DBContext,
          useValue: mockDbContext,
        },
      ],
    }).compile();

    handler = module.get<EventHandler>(EventHandler);
    jest.clearAllMocks();
  });

  it('should successfully handle an event and commit transaction', async () => {
    const eventType = 'USER_CREATED' as EventType;
    const payload = { userId: '123' };
    const event = { EventType: eventType, payload } as Event<unknown>;

    const callback = jest.fn().mockResolvedValue(undefined);
    handler.addListener(eventType, callback);

    await handler.handle(event);

    expect(mockDbContext.startTransaction).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(payload);
    expect(mockDbContext.commitTransaction).toHaveBeenCalled();
    expect(mockDbContext.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('should rollback transaction if callback fails', async () => {
    const eventType = 'USER_DELETED' as EventType;
    const event = { EventType: eventType, payload: {} } as Event<unknown>;

    const failingCallback = jest.fn().mockRejectedValue(new Error('DB Error'));
    handler.addListener(eventType, failingCallback);

    await handler.handle(event);

    expect(mockDbContext.startTransaction).toHaveBeenCalled();
    expect(mockDbContext.rollbackTransaction).toHaveBeenCalled();
    expect(mockDbContext.commitTransaction).not.toHaveBeenCalled();
  });

  it('should handle multiple listeners independently', async () => {
    const eventType = 'UPDATE' as EventType;
    const event = { EventType: eventType, payload: {} } as Event<unknown>;

    const successCallback = jest.fn().mockResolvedValue(undefined);
    const failCallback = jest.fn().mockRejectedValue(new Error('Fail'));

    handler.addListener(eventType, successCallback);
    handler.addListener(eventType, failCallback);

    await handler.handle(event);

    // Має бути 2 старти транзакцій (по одній на кожного слухача)
    expect(mockDbContext.startTransaction).toHaveBeenCalledTimes(2);
    expect(mockDbContext.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockDbContext.rollbackTransaction).toHaveBeenCalledTimes(1);
  });
});
