import { Module } from "@nestjs/common"
import { TiresModule } from "./tires/tires.module"

@Module({ imports: [TiresModule] })
export class AppModule {}
