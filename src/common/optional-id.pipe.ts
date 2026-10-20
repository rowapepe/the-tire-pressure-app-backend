import { ArgumentMetadata, Injectable, ParseIntPipe, PipeTransform } from '@nestjs/common'

@Injectable()
export class OptionalIdPipe implements PipeTransform<string | undefined, Promise<number | undefined>> {
	private readonly parseInt = new ParseIntPipe()

	async transform(value: string | undefined, metadata: ArgumentMetadata): Promise<number | undefined> {
		if (value === undefined || value === '' || value === '{id}') return undefined
		return (await this.parseInt.transform(value, metadata)) ?? undefined
	}
}
