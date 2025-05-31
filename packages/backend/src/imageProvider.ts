import { Collection, MongoClient, ObjectId } from "mongodb";

interface IImageDocument {
  _id: ObjectId;
  src: string;
  name: string;
  authorId: string;
}

interface IUserDocument {
  id: string;
  username: string;
  email: string;
}

interface IDenormalizedImage {
  id: string;
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

  async updateImageName(imageId: string, newName: string): Promise<number> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(imageId) },
      { $set: { name: newName } }
    );
    return result.matchedCount;
  }

  async getImages(nameFilter?: string): Promise<IDenormalizedImage[]> {
    const trimmed = nameFilter?.trim();
    const escapedFilter = trimmed
      ? trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      : null;

    const pipeline: object[] = [];

    // Add name filter if provided
    if (escapedFilter) {
      pipeline.push({
        $match: {
          name: {
            $regex: escapedFilter,
            $options: "i", // case-insensitive
          },
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          let: { authorIdStr: "$authorId" },
          pipeline: [
            {
              $addFields: {
                idStr: { $toString: "$_id" },
              },
            },
            {
              $match: {
                $expr: { $eq: ["$idStr", "$$authorIdStr"] },
              },
            },
          ],
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          src: 1,
          name: 1,
          author: {
            id: { $toString: "$author._id" },
            username: "$author.username",
            email: "$author.email",
          },
        },
      }
    );

    
    const results = await this.collection.aggregate(pipeline).toArray();
    return results as IDenormalizedImage[];
  }
}
