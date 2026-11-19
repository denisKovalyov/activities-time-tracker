import 'server-only';
import { revalidatePath } from 'next/cache';

// Activities and timer state are loaded in the content layout, so every
// change re-renders it with fresh data from the database.
export const revalidateUserData = () => revalidatePath('/', 'layout');
