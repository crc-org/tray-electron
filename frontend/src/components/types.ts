
export interface CrcState {
  readonly CrcStatus: string;
  readonly OpenshiftStatus?: string;
  readonly OpenshiftVersion?: string;
  readonly PodmanVersion?: string;
  readonly DiskUse: number;
  readonly DiskSize: number;
}
