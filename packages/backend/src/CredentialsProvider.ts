import { Collection, MongoClient } from "mongodb";
import bcrypt from "bcrypt";

interface ICredentialsDocument {
    username: string;
    password: string;
}

export class CredentialsProvider {
    private readonly collection: Collection<ICredentialsDocument>;

    constructor(mongoClient: MongoClient) {
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection<ICredentialsDocument>(COLLECTION_NAME);
    }

    async registerUser(username: string, plaintextPassword: string) {
        // Check if user already exists
        const existingUser = await this.collection.findOne({ username });
        if (existingUser) {
            return false;
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(plaintextPassword, salt);
        
        // console.log("Salt:", salt);
        // console.log("Hash:", hash);
        await this.collection.insertOne({ username, password: hash });

        return true;
    }

    async verifyPassword(username: string, plaintextPassword: string) {
        try {
            const user = await this.collection.findOne({ username });
            if (!user) {
                return false;
            }
            return await bcrypt.compare(plaintextPassword, user.password);
        } catch (error) {
            console.error("Error verifying password:", error);
            return false;
        }
    }
}