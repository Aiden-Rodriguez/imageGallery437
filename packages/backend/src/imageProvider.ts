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

  async getImageById(imageId: string) {
    const db = this.mongoClient.db();
    const image = await db.collection("images").findOne({ _id: new ObjectId(imageId) });
    return image;
  }

  async updateImageName(imageId: string, newName: string): Promise<number> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(imageId) },
      { $set: { name: newName } }
    );
    return result.matchedCount;
  }

  async getImages(nameFilter?: string, authorId?: string): Promise<IDenormalizedImage[]> {
    const trimmed = nameFilter?.trim();
    const escapedFilter = trimmed
      ? trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      : null;

    const pipeline: object[] = [];

    if (escapedFilter) {
      pipeline.push({
        $match: {
          name: {
            $regex: escapedFilter,
            $options: "i",
          },
        },
      });
    }

    if (authorId) {
      pipeline.push({
        $match: {
          authorId: authorId,
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
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      {
        $set: {
          author: {
            $cond: {
              if: { $eq: ["$author", {}] },
              then: {
                id: "$authorId",
                username: "Unknown User",
                email: "unknown@example.com",
              },
              else: {
                id: { $toString: "$author._id" },
                username: "$author.username",
                email: "$author.email",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          src: 1,
          name: 1,
          author: 1,
        },
      }
    );

    const results = await this.collection.aggregate(pipeline).toArray();
    return results as IDenormalizedImage[];
  }

  async createImage(data: {
    name: string;
    authorId: string;
    src: string;
  }): Promise<void> {
    const result = await this.collection.insertOne({
      _id: new ObjectId(),
      name: data.name,
      authorId: data.authorId,
      src: data.src,
    });
    if (!result.acknowledged) {
      throw new Error("Failed to insert image document");
    }
  }
}