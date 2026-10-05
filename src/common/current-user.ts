const CURRENT_USER_ID = 1

export interface CurrentUser {
	readonly id: number
}

let currentUser: CurrentUser | undefined

export function getCurrentUser(): CurrentUser {
	currentUser ??= Object.freeze({ id: CURRENT_USER_ID })
	return currentUser
}
