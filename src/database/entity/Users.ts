import {
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Entity,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
//class calidator contains modules to chack properties of the data entered into the database
import { IsEmail, Length } from "class-validator";
import { v4 as uuid } from "uuid";

//base entitity is differet from entity, dont need to write prover or sth
@Entity("users")
export default class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  //RFC compatible UUID from npm package uuid
  @Column({ type: "uuid" })
  uuid: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ unique: true })
  @Length(1, 50)
  username: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  @Length(8, 50)
  password: string;

  @BeforeInsert()
  // create and set the value of uuid of this class
  createUuid() {
    this.uuid = uuid();
  }
  // hides id: from being send to client
  toJSON() {
    return { ...this, id: undefined, password: undefined };
  }
}
