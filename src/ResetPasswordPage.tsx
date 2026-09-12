import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './ResetPasswordPage.css'

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setIsSubmitting(true);

        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        setIsSubmitting(false);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        setSuccess(true);
        setTimeout(() => {
            navigate('/');
        }, 2000);
    };

    return (
        <>
            <div className="reset-password-page">
                {success ? (
                    <p>Your password has been reset. Redirecting you to the homepage...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <h1>Reset Your Password</h1>
                        {error && <p className="reset-password-error">{error}</p>}
                        <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </>
    );
}