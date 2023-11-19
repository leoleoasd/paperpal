export type ColumnType = 'int64' | 'float64' | 'string';
export type NER = {
  tags: {
    start: number;
    end: number;
    value: number;
  }[]
};

export type LabelColumnSpec = {
  type: string;
  choices?: string[];
  relations?: {
    [key: string]: {
      from: string[];
      to: string[];
    };
  };
  target?: string;
};

export type ProjectSchema = {
  data_columns: {
    [key: string]: ColumnType;
  };
  label_columns: {
    [key: string]: LabelColumnSpec;
  };
};

export type Project = {
  created_at: Date;
  id: number;
  name: string;
  schema: ProjectSchema;
  task_description_prompt: string;
  updated_at: Date | null;
};

export type GetProjectsResponse = {
  code: number;
  message: string;
  projects: Project[];
};

export type DataFile = {
  columns: {
    [key: string]: ColumnType;
  };
  created_at: Date;
  id: number;
  name: string;
  save_path: string;
  updated_at: Date;
};

export type UploadFileResponse = {
  code: number;
  data_file: DataFile;
  message: string;
};

export type CreateProjectRequest = {
  name: string;
  file_id: number;
  schema: ProjectSchema;
  task_description_prompt: string;
}

export type CreateProjectResponse = {
  code: number,
  message: string,
  project: Project,
}

export type UpdateProjectRequest = {
  name?: string;
  file_id?: number;
  schema?: ProjectSchema;
  task_description_prompt?: string;
}

export type GetProjectResponse = {
  code: number,
  message: string,
  project: Project,
  meta: {
    count: number,
    has_label: number,
    first_no_label_id: number,
  }
}
export type GetProjectDataResponse = {
  code: number,
  message: string,
  data: {
    id: number;
    predictions: {
      [key: string]: NER | string | string[] | number | null;
    };
    [key: string]: NER | string | string[] | number | null | {
      [key: string]: NER | string | string[] | number | null;
    };
  },
  next_no_label_id: number,
}
export type UpdateDataRequest = {
  project_id: number,
  label_id: number,
  data: {
    [key: string]: NER | string | string[] | number | null | {
      [key: string]: NER | string | string[] | number | null;
    };
  }
}
export type UpdateDataResponse = {
  code: number,
  message: string,
  next_no_label_id: number,
}

// export interface Project<T = Date> {
//   id: number,
//   name: string,
//   create_time: T,
//   update_time: T,
//   labels?: (LabelsEntity<T>)[] | null,
// }

// export interface LabelsEntity<T = Date> {
//   label_id: number,
//   user_id: number,
//   config: LabelConfig,
//   current_model?: null,
//   create_time: T,
//   update_time: T,
// }

// export interface User {
//   id: number,
//   name: string,
//   token: string,
// }

// export interface CreateProjectResp {
//   saved_file: string,
//   project_id: number
// }

// export interface ProjectDetail<T = Date> {
//   project_meta: ProjectMeta<T>,
//   data_num: number,
//   label_num: number,
// }

// export interface ProjectDataResp {
//   data_num: number,
//   label_num?: number,
//   label_id?: number,
//   project_data: ProjectData[],
// }
// export interface ProjectMeta<T> {
//   id: number,
//   name: string,
//   file_path: string,
//   config: ProjectConfig,
//   create_time: T,
//   update_time: T,
// }
// export interface LabelConfig {
//   labels: (string)[],
//   columns: (string)[],
//   label_column: string,
//   label_export type: string,
// }
// export interface ProjectData {
//   id: number,
//   explanation: string,
//   [key: string]: string | number, // other columns
// }

// export interface UpdateLabelResp {
//   label_id: number,
//   label_data_num: number
// }


// export enum ModelStatus {
//   Idle = 0,
//   Training = 1
// }

// export enum Taskexport type {
//   Classification = 'classification',
//   SequenceTag = 'sequence_tag',
//   Relation = 'relation',
//   Ensli = 'ensli',
// }

// export interface Model {
//   id: number,
//   model_uuid: string,
//   // status: 0 空闲状态，1 training
//   status: ModelStatus,
//   label_id: number,
//   // extra: 初始时为空{}
//   extra: {
//     // train_begin: True
//     train_begin: boolean,
//     // total_steps: 总训练步骤数
//     total_steps?: number,
//     // current_step: 当前为所处训练步骤数
//     current_step?: number,
//     // train_end: False
//     train_end?: boolean,
//     // begin_time: timestamp
//     begin_time?: Date,
//     // progress:  所处步骤训练进度，1/10
//     progress?: string,
//     end_time?: Date,
//   },
//   deleted: boolean,
//   // iteration:迭代训练次数，触发过多少次训练
//   data_num: number,
//   create_time: Date,
//   update_time: Date,
// }


// export interface ProjectConfig {
//   columns: string[],
//   data_columns: string[],
//   task_export type: Taskexport type,
//   text_name_column?: string,
//   default_label_config: LabelConfig,
//   id_columns: string[],
// }
