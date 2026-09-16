import { Book } from '@/types';
import { INITIAL_BOOKS } from '@/data/mockBooks';
import { supabase } from '@/lib/supabaseClient';

export async function getBooks(): Promise<Book[]> {
  if (!supabase) {
    return INITIAL_BOOKS;
  }

  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Supabase books empty or error, using default mock books:', error);
      return INITIAL_BOOKS;
    }

    return data as Book[];
  } catch (err) {
    console.error('Error fetching books from Supabase:', err);
    return INITIAL_BOOKS;
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  if (!supabase) {
    return INITIAL_BOOKS.find((b) => b.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return INITIAL_BOOKS.find((b) => b.id === id) || null;
    }

    return data as Book;
  } catch (err) {
    return INITIAL_BOOKS.find((b) => b.id === id) || null;
  }
}
