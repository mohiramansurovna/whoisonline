import { type User} from '../entities/users.entity.ts';
import { query } from '../shared/lib/query.ts';

export const usersRepository={
    create:async (email:string, password:string):Promise<User|null>=>{
        const sql=`INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *`;
        const res=await query<User>(sql, [email,password])
        return res.rows[0]??null;
    },
    getByEmail:async(email:string):Promise<User|null>=>{
        const sql = `SELECT * FROM users WHERE email = $1`;
        const res = await query<User>(sql, [email])
        return res.rows[0]?? null;
    },
    getById:async(id:number):Promise<User|null>=>{
        const sql = `SELECT * FROM users WHERE id = $1`;
        const res = await query<User>(sql, [id])
        return res.rows[0]?? null;
    },
    updateLastSeen:async(id:number):Promise<void>=>{
        const sql = `UPDATE users SET last_seen = NOW() WHERE id = $1`;
        await query(sql, [id]);
    },
    delete:async(id:number):Promise<void>=>{
        const sql = `DELETE FROM users WHERE id = $1`;
        await query(sql, [id]);
    },
    getAll:async():Promise<User[]>=>{
        const sql = `SELECT * FROM users`;
        const res = await query<User>(sql);
        return res.rows;
    }
}