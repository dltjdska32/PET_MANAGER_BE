import { HydratedDocument } from 'mongoose';
export type FeedSyncDocument = HydratedDocument<FeedSync>;
export declare class FeedSync {
    feedId: string;
    authorId: string;
    username: string;
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
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const FeedSyncSchema: import("mongoose").Schema<FeedSync, import("mongoose").Model<FeedSync, any, any, any, any, any, FeedSync>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    feedId?: import("mongoose").SchemaDefinitionProperty<string, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    authorId?: import("mongoose").SchemaDefinitionProperty<string, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    username?: import("mongoose").SchemaDefinitionProperty<string, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    authorNickname?: import("mongoose").SchemaDefinitionProperty<string, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    regionId?: import("mongoose").SchemaDefinitionProperty<number, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mainImgUrl?: import("mongoose").SchemaDefinitionProperty<string[], FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sideImgUrl?: import("mongoose").SchemaDefinitionProperty<string[], FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    pay?: import("mongoose").SchemaDefinitionProperty<number, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    startDate?: import("mongoose").SchemaDefinitionProperty<Date | undefined, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    endDate?: import("mongoose").SchemaDefinitionProperty<Date | undefined, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    likesCount?: import("mongoose").SchemaDefinitionProperty<number, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    feedType?: import("mongoose").SchemaDefinitionProperty<string, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    feedCreatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    feedUpdatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isDeleted?: import("mongoose").SchemaDefinitionProperty<boolean, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, FeedSync, import("mongoose").Document<unknown, {}, FeedSync, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FeedSync & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, FeedSync>;
