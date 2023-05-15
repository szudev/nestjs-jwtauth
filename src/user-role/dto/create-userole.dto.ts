import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RolType } from '../../auth/types/roles.type';

export class CreateUserRoleDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(RolType)
  rol: RolType;
}
