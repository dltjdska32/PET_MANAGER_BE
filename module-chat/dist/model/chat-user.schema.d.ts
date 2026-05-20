import { HydratedDocument } from 'mongoose';
export type ChatUserDocument = HydratedDocument<ChatUser>;
export declare class ChatUser {
    userId: number;
    username: string;
    userNickname: string;
    userEmail: string;
    userRole: string;
    userMainImgUrl?: string;
    userRegionIds: number[];
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ChatUserSchema: import("mongoose").Schema<ChatUser, import("mongoose").Model<ChatUser, any, any, any, any, any, ChatUser>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChatUser, import("mongoose").Document<unknown, {}, ChatUser, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ChatUser & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<number, ChatUser, import("mongoose").Document<unknown, {}, ChatUser, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    username?: import("mongoose").SchemaDefinitionProperty<string, ChatUser, import("mongoose").Document<unknown, {}, ChatUser, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userNickname?: import("mongoose").SchemaDefinitionProperty<string, ChatUser, import("mongoose").Document<unknown, {}, ChatUser, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userEmail?: import("mongoose").SchemaDefinitionProperty<string, ChatUser, import("mongoose").Document<unknown, {}, ChatUser, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userRole?: import("mongoose").SchemaDefinitionProperty<string, ChatUser, import("mongoose").Document<unknown, {}, ChatUser, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userMainImgUrl?: import("mongoose").SchemaDefinitionProperty<string | undefined, ChatUser, import("mongoose").Document<unknown, {}, ChatUser, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userRegionIds?: import("mongoose").SchemaDefinitionProperty<number[], ChatUser, import("mongoose").Document<unknown, {}, ChatUser, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isDeleted?: import("mongoose").SchemaDefinitionProperty<boolean, ChatUser, import("mongoose").Document<unknown, {}, ChatUser, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, ChatUser, import("mongoose").Document<unknown, {}, ChatUser, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, ChatUser, import("mongoose").Document<unknown, {}, ChatUser, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatUser & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ChatUser>;
