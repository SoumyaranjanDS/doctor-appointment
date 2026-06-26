import React, { useState } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const ReviewMaker = ({ appointment, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      return toast.error('Please select a rating');
    }
    if (!comment.trim()) {
      return toast.error('Please write a review comment');
    }

    setLoading(true);
    try {
      await api.post('/reviews', {
        appointmentId: appointment._id,
        rating,
        comment
      });
      toast.success('Review submitted successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
          <h2 className="text-title-lg font-bold text-on-surface">Rate Your Experience</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <p className="text-sm font-bold text-on-surface-variant mb-2">How was your consultation with Dr. {appointment.doctorId?.name}?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <span 
                    className="material-symbols-outlined"
                    style={{ 
                      fontVariationSettings: (hoverRating || rating) >= star ? "'FILL' 1" : "'FILL' 0",
                      color: (hoverRating || rating) >= star ? '#FFB400' : '#E0E0E0'
                    }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant mt-2 h-4">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">Write a review</label>
            <textarea 
              rows="4" 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full p-4 rounded-2xl border border-outline-variant focus:border-primary outline-none resize-none bg-surface-container-lowest"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full font-bold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-full bg-primary text-white font-bold hover:bg-primary/90 shadow transition-all flex items-center gap-2">
              {loading ? <span className="animate-spin material-symbols-outlined text-[20px]">refresh</span> : null}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewMaker;
