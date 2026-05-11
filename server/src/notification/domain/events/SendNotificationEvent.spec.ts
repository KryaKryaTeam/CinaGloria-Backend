import { SendNotificationEvent } from 'src/notification/domain/events/SendNotificationEvent';
import { EventType } from 'src/common/domain/EventType';

describe('SendNotificationEvent', () => {
  const mockNotification = {
    id: 'notif-1',
    message: 'hello',
  } as any;

  it('should serialize to JSON correctly', () => {
    const event = new SendNotificationEvent(mockNotification);

    const json = event.toJSON();

    expect(json).toEqual({
      eventType: EventType.SEND_NOTIFICATION,
      payload: mockNotification,
    });
  });

  it('should reconstruct event from JSON using load()', () => {
    const event = new SendNotificationEvent(mockNotification);

    const json = event.toJSON();

    const loaded = event.load(json);

    expect(loaded).toBeInstanceOf(SendNotificationEvent);
    expect(loaded.toJSON()).toEqual(json);
  });

  it('should keep payload intact after load cycle', () => {
    const event = new SendNotificationEvent(mockNotification);

    const restored = event.load(event.toJSON());

    expect(restored.toJSON().payload).toEqual(mockNotification);
  });
});
