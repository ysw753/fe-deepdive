import { z } from 'zod';
export declare const AddressSchema: z.ZodObject<{
    line1: z.ZodString;
    line2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    postalCode: z.ZodString;
}, z.core.$strip>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    email: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<{
        admin: "admin";
        user: "user";
        manager: "manager";
    }>>;
    createdAt: z.ZodCoercedDate<unknown>;
    address: z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        postalCode: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type User = z.infer<typeof UserSchema>;
export declare const pageSchema: <T extends z.ZodTypeAny>(item: T) => z.ZodObject<{
    items: z.ZodArray<T>;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
    total: z.ZodNumber;
}, z.core.$strip>;
export declare const UserPageSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        email: z.ZodString;
        role: z.ZodDefault<z.ZodEnum<{
            admin: "admin";
            user: "user";
            manager: "manager";
        }>>;
        createdAt: z.ZodCoercedDate<unknown>;
        address: z.ZodObject<{
            line1: z.ZodString;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodString;
            postalCode: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
    total: z.ZodNumber;
}, z.core.$strip>;
export type UserPage = z.infer<typeof UserPageSchema>;
