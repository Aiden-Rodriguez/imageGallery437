import { Collection, MongoClient } from "mongodb";

interface IUserDocument {
    _id: string;
    username: string;
    email: string;
}

export class UserProvider {
    private readonly collection: Collection<IUserDocument>;

    constructor(mongoClient: MongoClient) {
        const COLLECTION_NAME = process.env.USERS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing USERS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection<IUserDocument>(COLLECTION_NAME);
    }

    async createUser(username: string): Promise<boolean> {
        try {
            // Check if user already exists
            const existingUser = await this.collection.findOne({ username });
            if (existingUser) {
                return false;
            }

            const userDoc: IUserDocument = {
                _id: username,
                username: username,
                email: "example@example.com",
            };

            await this.collection.insertOne(userDoc);
            return true;
        } catch (error) {
            console.error("Error creating user:", error);
            return false;
        }
    }
}