import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { EventDispatcher } from 'src/common/application/events/EventDispatcher';
import { EventHandler } from 'src/common/application/events/EventHandler';
import { EventType } from 'src/common/domain/EventType';
import { BaseTokens } from 'src/common/Tokens';
import { Notification } from 'src/notification/domain/entities/Notification';
import { SendNotificationEvent } from 'src/notification/domain/events/SendNotificationEvent';

@Injectable()
export class UserCreatedHandler {
  constructor(
    @Inject(BaseTokens.EventHandler) private eventHandler: EventHandler,
    @Inject(BaseTokens.EventDispatcher)
    private eventDispatcher: EventDispatcher,
  ) {
    eventHandler.addListener(EventType.USER_CREATED, (payload: UserEntity) => {
      this.eventDispatcher.addEvent(
        new SendNotificationEvent(
          Notification.create({
            title: 'Welcome to CinaGloria',
            content: `# Welcome to the Arena, Code-Runner!
          
          We are thrilled to have you on **CinaGloria** — the ultimate battleground for developers, innovators, and dreamers. Whether you are here to crush a 48-hour hackathon or build the next big thing, we've got your back.
          
          ### Your Journey Starts Here:
          * **Join a Tournament:** Browse active hackathons and pick your challenge.
          * **Form a Squad:** Find teammates with complementary skills or go solo.
          * **Review Tasks:** Deep dive into problem statements and technical requirements.
          * **Submit & Win:** Upload your project before the deadline and face the **Jury**.
          
          ### Important for Competitors:
          Your security during the tournament is vital. We will send you a **verification code** for sensitive actions (like submitting a final project or managing team access).
          
          > **Jury Note:** Be sure to read the evaluation criteria for each tournament. Points are often awarded for both technical complexity and original presentation.
          
          If you hit a bug or need help with the platform, reach out to the **Krya Krya Team**.
          
          Ready to ship?
          **The CinaGloria Team**`,
            from: 'System',
            targets: ['ws', 'email'],
            to: payload,
          }),
        ),
      );
      this.eventDispatcher.dispatchEvents();
    });
  }
}
