import fs from 'fs';
let f = fs.readFileSync('src/components/FlashcardReviewer.tsx', 'utf-8');

f = f.replace(
  `      const reviewMap: Record<string, FlashcardReview> = {};
      if (data) {
        data.forEach(r => {
          reviewMap[r.flashcard_id] = r;
        });
      }
      setReviews(reviewMap);

      const today = new Date().toISOString().split('T')[0];
      const due = internalCards.filter(fc => {
        const review = reviewMap[fc.id];
        if (!review) return true; // never reviewed
        return review.next_review_date <= today;
      });

      setDueCards(due);
      setLoading(false);
    }
    fetchReviews();
  }, [userId, flashcards]);`,
  `      const reviewMap: Record<string, FlashcardReview> = {};
      if (data) {
        data.forEach(r => {
          reviewMap[r.flashcard_id] = r;
        });
      }
      setReviews(reviewMap);

      const today = new Date().toISOString().split('T')[0];
      const due = internalCards.filter(fc => {
        const review = reviewMap[fc.id];
        if (!review) return true; // never reviewed
        return review.next_review_date <= today;
      });

      setDueCards(due);
      setLoading(false);
    }
    fetchReviews();
  }, [userId, internalCards]);` // fix dependency back to internalCards for the actual review logic
);

fs.writeFileSync('src/components/FlashcardReviewer.tsx', f);
