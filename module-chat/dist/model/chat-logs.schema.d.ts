import { HydratedDocument } from 'mongoose';
import { ChatUserInfo } from "../dtos/chat-user-info.dto";
export type ChatLogDocument = HydratedDocument<ChatLog>;
export interface FileMeta {
    originalName: string;
    storedName: string;
    mimeType: string;
    url: string;
}
export declare enum MessageType {
    FILE = "FILE",
    TEXT = "TEXT"
}
export declare class ChatLog {
    roomId: string;
    messageType: MessageType;
    message?: string;
    sender: ChatUserInfo;
    readUserIds: ChatUserInfo[];
    file?: FileMeta[];
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ChatLogSchema: import("mongoose").Schema<ChatLog, import("mongoose").Model<ChatLog, any, any, any, any, any, ChatLog>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChatLog, import("mongoose").Document<unknown, {}, ChatLog, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ChatLog & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    roomId?: import("mongoose").SchemaDefinitionProperty<string, ChatLog, import("mongoose").Document<unknown, {}, ChatLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    messageType?: import("mongoose").SchemaDefinitionProperty<MessageType, ChatLog, import("mongoose").Document<unknown, {}, ChatLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    message?: import("mongoose").SchemaDefinitionProperty<string | undefined, ChatLog, import("mongoose").Document<unknown, {}, ChatLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sender?: import("mongoose").SchemaDefinitionProperty<ChatUserInfo, ChatLog, import("mongoose").Document<unknown, {}, ChatLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    readUserIds?: import("mongoose").SchemaDefinitionProperty<ChatUserInfo[], ChatLog, import("mongoose").Document<unknown, {}, ChatLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    file?: import("mongoose").SchemaDefinitionProperty<FileMeta[] | undefined, ChatLog, import("mongoose").Document<unknown, {}, ChatLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isDeleted?: import("mongoose").SchemaDefinitionProperty<boolean, ChatLog, import("mongoose").Document<unknown, {}, ChatLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, ChatLog, import("mongoose").Document<unknown, {}, ChatLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, ChatLog, import("mongoose").Document<unknown, {}, ChatLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ChatLog>;
