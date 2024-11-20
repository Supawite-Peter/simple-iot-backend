export interface DeviceDetail {
  id: number;
  name: string;
  user_id: number;
  serial: string;
  topics: string[];
}

export interface TopicAdd {
  topics_added: number;
  topics: string[];
}

export interface TopicRemove {
  topics_removed: number;
  topics: string[];
}
