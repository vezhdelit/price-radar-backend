import KSUID from "ksuid";

export function generateRandomDomainId(
  prefix: string,
) {
  const ksuid = KSUID.randomSync();
  return `${prefix}_${ksuid.string}`;
}
