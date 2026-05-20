import type { ClientSession } from "mongoose";
import { Model } from "mongoose";
import { ChatUserDocument } from "../chat-user.schema";
export declare class ChatUserRepo {
    private readonly model;
    constructor(model: Model<ChatUserDocument>);
    findChatUserDocumentByUserId(userId: number, session?: ClientSession | null): Promise<ChatUserDocument | null>;
}
