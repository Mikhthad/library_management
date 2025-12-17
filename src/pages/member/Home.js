import { useEffect, useState } from "react";
import api from "../../api";
import "./home.css";
import MemberNavbar from "./MemberNavbar";

const BACKEND_URL = "http://127.0.0.1:8000";
const DEFAULT_COVER = "/default-book.png"; // put a default image in public/

function Home() {
  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);

  const [bookDetails, setBookDetails] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchWishlist();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get("/api/books/list/");
      setBooks(res.data);
    } catch (error) {
      console.log("Fetch books error", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/books/category_list/");
      setCategories(res.data);
    } catch (error) {
      console.log("Category fetch error", error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/api/books/wishlist/my/");
      setWishlist(res.data);
      setWishlistIds(res.data.map((w) => w.book));
    } catch (error) {
      console.log("Wishlist fetch error", error);
    }
  };


  const searchBook = async () => {
    try {
      const res = await api.get("/api/books/search/", {
        params: {
          q: query,
          author,
          year,
          category: selectedCategory,
          available: availableOnly,
        },
      });
      setBooks(res.data);
      setBookDetails(null);
    } catch (error) {
      console.log("Search error", error);
    }
  };

  const loadBookDetails = async (id) => {
    try {
      const res = await api.get(`/api/books/details/${id}`);
      setBookDetails(res.data);
    } catch (error) {
      console.log("Book details error", error);
    }
  };


  const addWishlist = async (bookId) => {
    try {
      await api.post("/api/books/wishlist/add/", { book: bookId });
      fetchWishlist();
    } catch (error) {
      console.log("Add wishlist error", error);
    }
  };

  const removeWishlist = async (bookId) => {
    try {
      const wishlistItem = wishlist.find((w) => w.book === bookId);
      if (!wishlistItem) return;
      await api.delete(`/api/books/wishlist/remove/${wishlistItem.id}/`);
      fetchWishlist();
    } catch (error) {
      console.log("Remove wishlist error", error);
    }
  };


  const submitReview = async () => {
    if (!comment.trim()) {
      alert("Please write a review");
      return;
    }

    try {
      setReviewLoading(true);
      await api.post("/api/books/review/add/", {
        book: bookDetails.book.id,
        rating,
        comment,
      });
      setComment("");
      loadBookDetails(bookDetails.book.id);
    } catch (error) {
      console.log("Review failed", error);
    } finally {
      setReviewLoading(false);
    }
  };


  return (
    <div className="with-navbar">
      <MemberNavbar />

      <div className="home-container">
        <h3>📚 Library Search</h3>

        <div className="search-box">
          <input placeholder="Title / ISBN" value={query}
            onChange={(e) => setQuery(e.target.value)}/>

          <input placeholder="Author" value={author}
            onChange={(e) => setAuthor(e.target.value)}/>

          <input placeholder="Year" value={year}
            onChange={(e) => setYear(e.target.value)}/>

          <select value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}> {c.name} </option>
            ))}
          </select>

          <label className="checkbox">
            <input type="checkbox" checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}/> Available Only
          </label>

          <button onClick={searchBook}>Search</button>
        </div>

        <div className="book-list">
          {books.map((b) => (
            <div key={b.id} className="book-card">
              <img
                src={
                  b.coverimg
                    ? `${BACKEND_URL}${b.coverimg}`
                    : DEFAULT_COVER
                }
                alt={b.title}
                onError={(e) => (e.target.src = DEFAULT_COVER)}
              />

              <h4>{b.title}</h4>
              <p>{b.author}</p>

              <p className={b.available ? "available" : "not"}>
                {b.available ? "Available" : "Not Available"}
              </p>

              <div className="actions">
                <button onClick={() => loadBookDetails(b.id)}>Details</button>

                {wishlistIds.includes(b.id) ? (
                  <button className="heart active"
                    onClick={() => removeWishlist(b.id)}> ♥ </button>
                ) : (
                  <button className="heart"
                    onClick={() => addWishlist(b.id)}> ♡ </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {bookDetails && (
          <div className="details-box">
            <h2>{bookDetails.book.title}</h2>

            <img
              src={
                bookDetails.book.coverimg ? `${BACKEND_URL}${bookDetails.book.coverimg}`: DEFAULT_COVER}
              alt={bookDetails.book.title}
              onError={(e) => (e.target.src = DEFAULT_COVER)}/>

            <p>
              <b>Author:</b> {bookDetails.book.author}
            </p>
            <p>
              <b> Genre: </b> {bookDetails.book.genre}
            </p>
            <p>
              <b>Category:</b> {bookDetails.book.category_name}
            </p>
            <p>
              <b>Description:</b> {bookDetails.book.description}
            </p>
            <p>
              <b>Status:</b>{" "}
              {bookDetails.book.available ? "Available" : "Not Available"}
            </p>

            <h3>⭐ Reviews</h3>
            {bookDetails.reviews.length ? (
              bookDetails.reviews.map((r) => (
                <p key={r.id}>
                  {r.username} ⭐ {r.rating} – {r.comment}
                </p>
              ))
            ) : (
              <p>No reviews yet</p>
            )}

            <h3>Add Review</h3>
            <select value={rating}
              onChange={(e) => setRating(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} Star
                </option>
              ))}
            </select>

            <textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button onClick={submitReview} disabled={reviewLoading}>
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
