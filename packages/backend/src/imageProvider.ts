import { Collection, MongoClient, ObjectId } from "mongodb";

interface IImageDocument {
  _id: ObjectId;
  src: string;
  name: string;
  authorId: string; // String matching users._id
}

interface IUserDocument {
  id: string; // frontend wants 'id', not '_id'
  username: string;
  email: string;
}

interface IDenormalizedImage {
  id: string; // frontend wants 'id', not '_id'
  src: string;
  name: string;
  author: IUserDocument;
}

export class ImageProvider {
  private collection: Collection<IImageDocument>;

  constructor(private readonly mongoClient: MongoClient) {
    const collectionName = process.env.IMAGES_COLLECTION_NAME;
    if (!collectionName) {
      throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
    }

    this.collection = this.mongoClient
      .db()
      .collection<IImageDocument>(collectionName);
  }

  async getAllImages(): Promise<IDenormalizedImage[]> {
    const imagesWithAuthor = await this.collection
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author"
          }
        },
        { $unwind: "$author" },
        {
          $project: {
            _id: 0,
            id: { $toString: "$_id" },
            src: 1,
            name: 1,
            author: {
              id: "$author._id",
              username: "$author.username",
              email: "$author.email"
            }
          }
        }
        
      ])
      .toArray();

    return imagesWithAuthor as IDenormalizedImage[];
  }
}
