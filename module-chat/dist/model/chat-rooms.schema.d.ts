import { HydratedDocument } from 'mongoose';
import { ChatUserInfo } from "../dtos/chat-user-info.dto";
export type ChatRoomDocument = HydratedDocument<ChatRoom>;
export type FeedInfo = {
    feedId: string;
    authorId: number;
    authorUsername: string;
    authorNickname: string;
    title: string;
    description: string;
    regionId: number;
    mainImgUrl: string[];
    sideImgUrl: string[];
    pay: number;
    startDate?: Date;
    endDate?: Date;
    likesCount: number;
    feedType: string;
    feedCreatedAt?: Date;
    feedUpdatedAt?: Date;
};
export declare class ChatRoom {
    feedInfo: FeedInfo;
    chatRoomName?: string;
    creatorId: number;
    chatMembers: ChatUserInfo[];
    lastMessage?: string;
    lastMessageId?: string;
    lastMessageCreatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}
export declare const ChatRoomSchema: import("mongoose").Schema<ChatRoom, import("mongoose").Model<ChatRoom, any, any, any, any, any, ChatRoom>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChatRoom, import("mongoose").Document<unknown, {}, ChatRoom, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ChatRoom & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    feedInfo?: import("mongoose").SchemaDefinitionProperty<FeedInfo, ChatRoom, import("mongoose").Document<unknown, {}, ChatRoom, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatRoom & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    chatRoomName?: import("mongoose").SchemaDefinitionProperty<string | undefined, ChatRoom, import("mongoose").Document<unknown, {}, ChatRoom, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatRoom & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    creatorId?: import("mongoose").SchemaDefinitionProperty<number, ChatRoom, import("mongoose").Document<unknown, {}, ChatRoom, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatRoom & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    chatMembers?: import("mongoose").SchemaDefinitionProperty<ChatUserInfo[], ChatRoom, import("mongoose").Document<unknown, {}, ChatRoom, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatRoom & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lastMessage?: import("mongoose").SchemaDefinitionProperty<string | undefined, ChatRoom, import("mongoose").Document<unknown, {}, ChatRoom, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatRoom & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lastMessageId?: import("mongoose").SchemaDefinitionProperty<string | undefined, ChatRoom, import("mongoose").Document<unknown, {}, ChatRoom, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatRoom & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lastMessageCreatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, ChatRoom, import("mongoose").Document<unknown, {}, ChatRoom, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatRoom & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, ChatRoom, import("mongoose").Document<unknown, {}, ChatRoom, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatRoom & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, ChatRoom, import("mongoose").Document<unknown, {}, ChatRoom, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatRoom & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isDeleted?: import("mongoose").SchemaDefinitionProperty<boolean, ChatRoom, import("mongoose").Document<unknown, {}, ChatRoom, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatRoom & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ChatRoom>;
