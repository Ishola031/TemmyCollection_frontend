import React from 'react';
import Image from 'next/image';
import { Star, StarHalf } from 'lucide-react';

// Helper component to render stars based on backend numerical rating (e.g., 3.5)
function DynamicStarRating({ rating }) {
    // Calculates full, half, and empty stars
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-0.5 text-amber-400">
            {/* Full Stars */}
            {fullStars >= 1 && <Star className="w-4 h-4 fill-amber-400" />}
            {fullStars >= 2 && <Star className="w-4 h-4 fill-amber-400" />}
            {fullStars >= 3 && <Star className="w-4 h-4 fill-amber-400" />}
            {fullStars >= 4 && <Star className="w-4 h-4 fill-amber-400" />}
            {fullStars >= 5 && <Star className="w-4 h-4 fill-amber-400" />}

            {/* Half Star */}
            {hasHalfStar && <StarHalf className="w-4 h-4 fill-amber-400" />}

            {/* Empty Stars */}
            {emptyStars >= 1 && <Star className="w-4 h-4 text-gray-300 fill-gray-200" />}
            {emptyStars >= 2 && <Star className="w-4 h-4 text-gray-300 fill-gray-200" />}
            {emptyStars >= 3 && <Star className="w-4 h-4 text-gray-300 fill-gray-200" />}
            {emptyStars >= 4 && <Star className="w-4 h-4 text-gray-300 fill-gray-200" />}
            {emptyStars >= 5 && <Star className="w-4 h-4 text-gray-300 fill-gray-200" />}
        </div>
    );
}

export default function CustomerFeedback() {
    return (
        <section className="w-full flex flex-col px-5 sm:px-10 lg:px-16 pb-5">
            {/* Header */}
            <div className="w-full py-3 border-b border-gray-200">
                <h4 className="font-semibold text-xl text-gray-800">Verified Customer Feedback</h4>
            </div>

            {/* Reviews List */}
            <div className="w-full flex flex-col py-4 gap-6">
                {/* Review 1 - Rating 4.5 from Backend */}
                <div className="flex gap-4 border-b border-gray-100 pb-4">
                    <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden border border-gray-300">
                        <Image
                            src="/avatar-placeholder.png"
                            alt="MD MERAJ"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            unoptimized
                        />
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h5 className="font-medium text-gray-900 leading-tight">MD MERAJ</h5>
                                <p className="text-xs text-gray-500 mt-0.5">2025-08-18</p>
                            </div>

                            {/* Star Rating dynamically renders 4.5 */}
                            <DynamicStarRating rating={4.5} />
                        </div>

                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odio, vel aut neque praesentium doloremque voluptates!
                        </p>
                    </div>
                </div>

                {/* Review 2 - Rating 2.5 from Backend */}
                <div className="flex gap-4">
                    <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden border border-gray-300">
                        <Image
                            src="/avatar-placeholder.png"
                            alt="MD MERAJ"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            unoptimized
                        />
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h5 className="font-medium text-gray-900 leading-tight">MD MERAJ</h5>
                                <p className="text-xs text-gray-500 mt-0.5">2025-08-18</p>
                            </div>

                            {/* Star Rating dynamically renders 2.5 */}
                            <DynamicStarRating rating={2.5} />
                        </div>

                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odio, vel aut neque praesentium doloremque voluptates!
                        </p>
                    </div>
                </div>
            </div>

            {/* Review Form - User Input Selection with Half-Stars (1, 1.5, 2, 2.5, etc.) */}
            <form className="pt-4 border-t border-gray-200 flex flex-col gap-3">
                <h4 className="font-semibold text-lg text-gray-800">Add a review</h4>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Select Rating:</label>
                    <select
                        name="rating"
                        step="0.5"
                        defaultValue="5"
                        className="w-36 p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    >
                        <option value="5">5.0 Stars</option>
                        <option value="4.5">4.5 Stars</option>
                        <option value="4">4.0 Stars</option>
                        <option value="3.5">3.5 Stars</option>
                        <option value="3">3.0 Stars</option>
                        <option value="2.5">2.5 Stars</option>
                        <option value="2">2.0 Stars</option>
                        <option value="1.5">1.5 Stars</option>
                        <option value="1">1.0 Star</option>
                    </select>
                </div>

                <textarea
                    placeholder="Write your review here..."
                    className="w-full h-24 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                ></textarea>

                <div>
                    <button
                        type="submit"
                        className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors cursor-pointer"
                    >
                        Submit Review
                    </button>
                </div>
            </form>
        </section>
    );
}