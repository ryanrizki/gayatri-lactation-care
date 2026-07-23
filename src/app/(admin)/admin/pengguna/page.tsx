import { requireAdmin } from "@/lib/require-admin";
import { auth } from "@/auth";
import { listUsersForAdmin } from "@/lib/users";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddUserForm from "@/components/admin/AddUserForm";
import UserRowActions from "@/components/admin/UserRowActions";

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const roleBadge: Record<"USER" | "ADMIN", string> = {
  ADMIN: "bg-primary/10 text-primary",
  USER: "bg-muted text-muted-foreground",
};

export default async function AdminUsersPage() {
  await requireAdmin();
  const session = await auth();
  const currentId = session?.user?.id;
  const users = await listUsersForAdmin();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Pengguna
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola akun: tambah user, reset password, atau hapus.
          </p>
        </div>
        <AddUserForm />
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Enrollment</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="px-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isSelf = u.id === currentId;
              return (
                <TableRow key={u.id}>
                  <TableCell className="px-4 font-medium">
                    {u.nama}
                    {isSelf ? (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (Anda)
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                        roleBadge[u.role],
                      )}
                    >
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {u.enrollmentCount}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {dateFmt.format(u.createdAt)}
                  </TableCell>
                  <TableCell className="px-4">
                    <UserRowActions id={u.id} nama={u.nama} isSelf={isSelf} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
