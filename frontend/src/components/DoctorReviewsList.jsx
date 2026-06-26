import React, { useEffect, useState } from 'react';
import api from '../config/api';

const DoctorReviewsList = ({ doctorId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/reviews/doctor/${doctorId}`);
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) fetchReviews();
  }, [doctorId]);

  if (loading) return <div className="text-center p-4 text-on-surface-variant">Loading reviews...</div>;

  if (reviews.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-outline-variant/30">
      <h3 className="text-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">reviews</span>
        Patient Reviews ({reviews.length})
      </h3>
      
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {reviews.map(review => (
          <div key={review._id} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                  {review.patientId?.firstName?.charAt(0) || 'P'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">
                    {review.patientId?.firstName} {review.patientId?.lastName}
                  </h4>
                  <span className="text-xs text-on-surface-variant">
                    {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex text-secondary text-sm">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${i < review.rating ? 1 : 0}, 'wght' 400` }}>
                    star
                  </span>
                ))}
              </div>
            </div>
            {review.comment && (
              <p className="text-on-surface-variant text-sm leading-relaxed mt-2 italic">
                "{review.comment}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorReviewsList;
