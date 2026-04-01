import { SetMetadata } from '@nestjs/common';

import type { ApiPermission } from '@trustshield/validation';

export const REQUIRED_PERMISSIONS_KEY = 'trustshield:required-permissions';

export function Permissions(...permissions: ApiPermission[]) {
  return SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
}
