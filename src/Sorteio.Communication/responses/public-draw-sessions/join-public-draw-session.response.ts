import { ApiProperty } from '@nestjs/swagger';

export class JoinPublicDrawSessionResponse {
    @ApiProperty()
    entryId!: string;

    @ApiProperty()
    publicCode!: string;

    @ApiProperty()
    displayName!: string;

    @ApiProperty()
    joinedAt!: Date;
}