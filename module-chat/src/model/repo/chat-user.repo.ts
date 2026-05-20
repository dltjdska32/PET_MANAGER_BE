import type { ClientSession } from "mongoose";
import { Model } from "mongoose";
import { ChatUser, ChatUserDocument } from "../chat-user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ChatUserRepo {

    constructor(
        @InjectModel(ChatUser.name) 
        private readonly model: Model<ChatUserDocument>,
    ){}

    
    async findChatUserDocumentByUserId(userId: number, session?: ClientSession | null): Promise<ChatUserDocument | null> {
        const query = this.model.findOne({ userId, isDeleted: false });
        
        if (session) {
            query.session(session);
        }
        
        return await query.exec();
    }

}