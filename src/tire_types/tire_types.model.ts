export interface TireTypes {
	id: number
	status: 'draft' | 'published' | 'deleted'
	title: string
	description: string

	season: 'летняя' | 'зимняя' | 'всесезонная'
	optimalPressure: number
	radius: number

	imageKey: string
	videoKey: string

	likes: number[]
}
