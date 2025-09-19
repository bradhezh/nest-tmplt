-- the default one is "on delete cascade", which is actually OK for _RoleToUser;
-- just as a demo for "on delete restrict" on m:n relationships

-- DropForeignKey
ALTER TABLE "_RoleToUser" DROP CONSTRAINT "_RoleToUser_A_fkey";

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
