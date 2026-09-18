import { Module } from "@nestjs/common"
import { TireTypesModule } from "./tire_types/tire_types.module"

@Module({ imports: [TireTypesModule] })
export class AppModule {}
