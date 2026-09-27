import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PlanName, SubscriptionStatus } from '@common/constants/plans.constant';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ enum: PlanName })
  @IsOptional()
  @IsEnum(PlanName)
  planName?: PlanName;

  @ApiPropertyOptional({ enum: SubscriptionStatus })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}
