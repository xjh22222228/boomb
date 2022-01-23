
export enum FileEncode {
  RawName = 1,
  NumRawName,
  UUID,
  Timestamp
}

export enum Provider {
  Github = 1,
  Gitee
}

export enum NetworkCDN {
  Github = 1,
  Jsdelivr,
  Gitee
}

export enum SortType {
  FileSize = 1, // 文件大小
  FileName // 文件名
}
