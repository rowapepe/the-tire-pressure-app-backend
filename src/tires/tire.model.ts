export interface Tire {
	id: number
	status: "draft" | "published" | "deleted"
	title: string
	description: string

	tireType: "летняя" | "зимняя" | "всесезонная"
	temperature: number
	vehicleWeight: number
	surfaceCoefficient: number
	recommendedPressure: number

	imageKey: string
	videoKey: string

	likes: number[]
}
