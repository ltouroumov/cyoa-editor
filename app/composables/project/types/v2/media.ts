export interface ProjectImage {
  id: string;
  isRemote: boolean;
  // contains the URL or base64 data (src ready)
  data: string;
}
