import { Model } from "@nozbe/watermelondb";
import { field, text } from "@nozbe/watermelondb/decorators";

export class EmotionModel extends Model {
  static override table = "emotions";

  @text("label") label!: string;
  @text("emoji") emoji!: string;
  @text("color") color!: string;
  @text("group") group!: "core" | "secondary";
  @field("sort_order") sortOrder!: number;
  @field("valence") valence!: number;
  @field("intensity") intensity!: number;
}
