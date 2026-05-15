import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { RoundSchema } from 'src/schemas/Round.schema';
import { TaskMapper } from './Task.mapper';
import { MapperTokens } from 'src/common/Tokens';
import { TeamMapper } from 'src/teams/application/mappers/team.mapper';
import { LeaderboardMapper } from 'src/leaderboard/appliaction/mapper/LeaderboardMapper';
import { SubmitionMapper } from 'src/judging/application/mappers/SubmitionMapper';

@Injectable()
export class RoundMapper extends Mapper<RoundSchema, RoundEntity> {
  @Inject(forwardRef(() => MapperTokens.TaskMapper))
  private readonly taskMapper: TaskMapper;

  @Inject(MapperTokens.TeamMapper)
  private readonly teamMapper: TeamMapper;

  @Inject(MapperTokens.LeaderboardMapper)
  private readonly leaderboardMapper: LeaderboardMapper;

  @Inject(MapperTokens.SubmitionMapper)
  private readonly submissionMapper: SubmitionMapper;

  public toEntity(schema: RoundSchema) {
    const tasks = schema.relatedTasks.map((task) =>
      this.taskMapper.toEntity(task),
    );

    return RoundEntity.load({
      id: schema.id,
      name: schema.name,
      description: schema.description,
      startOfRound: schema.startOfRound,
      taskTimeout: schema.taskTimeout,
      endOfRound: schema.endOfRound,
      hidden: schema.hidden,
      icon: schema.icon,
      relatedTasks: tasks,
      status: schema.status,
      teams: schema.teams
        ? schema.teams.map((team) => this.teamMapper.toEntity(team))
        : [],
      leaderboard: this.leaderboardMapper.toEntity(schema.leaderboard),
      submissions: schema.submissions
        ? schema.submissions.map((submission) =>
            this.submissionMapper.toEntity(submission),
          )
        : undefined,
    });
  }

  public toSchema(entity: RoundEntity): RoundSchema {
    const schema = new RoundSchema();

    schema.id = entity.id;
    schema.name = entity.name;
    schema.description = entity.description;
    schema.hidden = entity.hidden;
    schema.startOfRound = entity.startOfRound;
    schema.taskTimeout = entity.taskTimeout;
    schema.endOfRound = entity.endOfRound;
    schema.icon = entity.icon!;
    schema.status = entity.status;
    schema.relatedTasks = entity.relatedTasks.map((task) =>
      this.taskMapper.toSchema(task),
    );
    schema.teams = entity.teams.map((team) => this.teamMapper.toSchema(team));
    if (entity.leaderboard)
      schema.leaderboard = this.leaderboardMapper.toSchema(entity.leaderboard);
    if (entity.submissions)
      schema.submissions = entity.submissions.map((submission) =>
        this.submissionMapper.toSchema(submission),
      );

    return schema;
  }
}
