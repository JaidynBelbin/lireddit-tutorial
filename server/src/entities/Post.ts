import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ObjectType, Field } from 'type-graphql';

// Adding @ObjectType and @Field exposes these fields to the graphQL server
@ObjectType()
@Entity()
export class Post {
  @Field()
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({type: Date})
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: Date, onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({type: 'text'})
  title!: string;
}