export function gcd(a: number, b: number): number {
	// Greatest common divisor of 2 integers
	if (!b) {
		return b === 0 ? a : NaN;
	}
	return gcd(b, a % b);
}


export function lcm(a: number, b: number): number {
	// Least common multiple of 2 integers
	return a * b / gcd(a, b);
}
