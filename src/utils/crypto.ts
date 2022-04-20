import { randomBytes, createHmac, timingSafeEqual } from "crypto";
import { LogSeverity, log } from "./log";

export function secureTimingSafeEqual(a: string, b: string) {
	const randomKey = randomBytes(64).toString("hex"); // create new random key everytime

	const hashedA = createHmac("sha256", randomKey).update(a, "utf8").digest();
	const hashedB = createHmac("sha256", randomKey).update(b, "utf8").digest();

	const ret = timingSafeEqual(hashedA, hashedB);

	log(`equal = ${ ret }`, "secureTimingSafeEqual", LogSeverity.DEBUG);
	return ret;
}
