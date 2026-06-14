'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, Row, Col, Badge, Spinner, Button, ListGroup, Modal, Form, Alert } from 'react-bootstrap';
import { communityMembershipApi } from '@/lib/api/community-membership.api';
import PageHeader from '@/components/ui/PageHeader';

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [purchase, setPurchase] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'settle' | 'reject' | 'mark_pending'>('settle');
  const [adminNote, setAdminNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetch = useCallback(async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        communityMembershipApi.getPurchase(id),
        communityMembershipApi.getPurchaseCard(id).catch(() => null),
      ]);
      setPurchase(pRes.data);
      setCard(cRes?.data ?? null);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAction = async () => {
    setActionLoading(true); setErrorMsg('');
    try {
      if (confirmAction === 'settle') {
        await communityMembershipApi.settlePurchase(id, adminNote);
      } else if (confirmAction === 'reject') {
        await communityMembershipApi.rejectPurchase(id, adminNote);
      } else {
        await communityMembershipApi.updatePurchaseStatus(id, 'pending_payment');
      }
      setShowConfirm(false); setAdminNote(''); fetch();
    } catch (err: any) { setErrorMsg(err?.message || 'Action failed'); }
    finally { setActionLoading(false); }
  };

  const handleRegenPdf = async () => {
    try { await communityMembershipApi.regeneratePdf(id); alert('PDF regeneration initiated'); fetch(); }
    catch { alert('Failed'); }
  };

  const openConfirm = (action: 'settle' | 'reject' | 'mark_pending') => {
    setConfirmAction(action); setAdminNote(''); setErrorMsg(''); setShowConfirm(true);
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (!purchase) return <div className="text-center py-5">Purchase not found</div>;

  const isPending = purchase.status === 'pending_payment';
  const isPaid = purchase.status === 'paid';

  // Extract manual transaction info from payment payload
  const manualTxn = purchase.payment?.payload?.manualTransaction;
  const paymentPayload = purchase.payment?.payload || {};

  return (
    <>
      <PageHeader title="Purchase Detail" breadcrumbs={[{ label: 'Purchases', href: '/community-care/membership/purchases' }, { label: purchase.memberName }]} />

      {errorMsg && <Alert variant="danger" dismissible onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}

      <Row className="g-3">
        <Col md={6}>
          <Card>
            <Card.Header><h5 className="mb-0">Member Info</h5></Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item><strong>Name:</strong> {purchase.memberName}</ListGroup.Item>
              <ListGroup.Item><strong>Mobile:</strong> {purchase.memberMobile}</ListGroup.Item>
              <ListGroup.Item><strong>Email:</strong> {purchase.memberEmail || '-'}</ListGroup.Item>
              <ListGroup.Item><strong>Address:</strong> {purchase.memberAddress || '-'}</ListGroup.Item>
              {purchase.preferredZone && (
                <ListGroup.Item>
                  <strong>Preferred Zone:</strong>{' '}
                  {purchase.preferredZone.name}
                  <span className="text-muted ms-1 small">({purchase.preferredZone.city})</span>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header><h5 className="mb-0">Membership Info</h5></Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item><strong>Tier:</strong> <Badge bg="info">{purchase.tier?.nameEn}</Badge></ListGroup.Item>
              <ListGroup.Item><strong>Amount:</strong> {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(Number(purchase.amountBdt))}</ListGroup.Item>
              <ListGroup.Item><strong>Status:</strong> <Badge bg={isPaid ? 'success' : 'warning'}>{purchase.status}</Badge></ListGroup.Item>
              <ListGroup.Item><strong>Pet Limit:</strong> {purchase.petLimit}</ListGroup.Item>
              <ListGroup.Item><strong>Starts:</strong> {purchase.startsAt ? new Date(purchase.startsAt).toLocaleDateString() : '-'}</ListGroup.Item>
              <ListGroup.Item><strong>Expires:</strong> {purchase.expiresAt ? new Date(purchase.expiresAt).toLocaleDateString() : '-'}</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        {/* Admin Settlement Panel */}
        <Col md={12}>
          <Card className={isPending ? 'border-warning' : ''}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Payment & Settlement</h5>
              <div className="d-flex gap-2">
                {isPending && (
                  <>
                    <Button size="sm" variant="success" onClick={() => openConfirm('settle')}>Mark as Paid</Button>
                    <Button size="sm" variant="danger" onClick={() => openConfirm('reject')}>Reject</Button>
                  </>
                )}
                {isPaid && (
                  <>
                    <Button size="sm" variant="outline-success" onClick={handleRegenPdf}>Regenerate PDF</Button>
                    <Button size="sm" variant="outline-warning" onClick={() => openConfirm('mark_pending')}>Mark Pending</Button>
                  </>
                )}
              </div>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item><strong>Gateway:</strong> {purchase.payment?.gateway || '-'}</ListGroup.Item>
              <ListGroup.Item><strong>Merchant Txn ID:</strong> {purchase.payment?.merchantTxnId || '-'}</ListGroup.Item>
              <ListGroup.Item><strong>Payment Status:</strong> <Badge bg={purchase.payment?.status === 'success' ? 'success' : 'warning'}>{purchase.payment?.status || 'none'}</Badge></ListGroup.Item>
              {manualTxn && (
                <>
                  <ListGroup.Item><strong>Manual Provider:</strong> {manualTxn.provider || '-'}</ListGroup.Item>
                  <ListGroup.Item><strong>Submitted Txn ID:</strong> {manualTxn.transactionId || '-'}</ListGroup.Item>
                  <ListGroup.Item><strong>Submitted At:</strong> {manualTxn.submittedAt ? new Date(manualTxn.submittedAt).toLocaleString() : '-'}</ListGroup.Item>
                </>
              )}
              {purchase.notes && <ListGroup.Item><strong>Notes:</strong><pre className="mb-0 mt-1 text-xs">{purchase.notes}</pre></ListGroup.Item>}
            </ListGroup>
          </Card>
        </Col>

        {card && (
          <Col md={12}>
            <Card>
              <Card.Header className="d-flex justify-content-between">
                <h5 className="mb-0">Digital Card</h5>
                {isPaid && <Button size="sm" variant="outline-success" onClick={handleRegenPdf}>Regenerate PDF</Button>}
              </Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item><strong>Card Number:</strong> <code>{card.cardNumber}</code></ListGroup.Item>
                <ListGroup.Item><strong>Status:</strong> <Badge bg={card.status === 'active' ? 'success' : 'secondary'}>{card.status}</Badge></ListGroup.Item>
                <ListGroup.Item><strong>QR Token:</strong> <code className="text-xs">{card.qrToken}</code></ListGroup.Item>
                <ListGroup.Item><strong>Download Token:</strong> {card.downloadToken ? <code>{card.downloadToken}</code> : '-'}</ListGroup.Item>
                <ListGroup.Item><strong>PDF Generated:</strong> {card.pdfDocumentKey ? <Badge bg="success">Yes</Badge> : <Badge bg="secondary">No</Badge>}</ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        )}
      </Row>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {confirmAction === 'settle' ? 'Confirm Payment' : confirmAction === 'reject' ? 'Reject Payment' : 'Mark as Pending'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-sm text-gray-600 mb-3">
            {confirmAction === 'settle' && 'This will generate the membership card, QR token, and activate the membership. It will also mark the payment as success.'}
            {confirmAction === 'reject' && 'This will cancel the purchase. The member will need to re-submit payment.'}
            {confirmAction === 'mark_pending' && 'This will move the purchase back to pending payment status.'}
          </p>
          <Form.Group>
            <Form.Label>Admin Note (optional)</Form.Label>
            <Form.Control as="textarea" rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Reason for this action..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant={confirmAction === 'settle' ? 'success' : confirmAction === 'reject' ? 'danger' : 'warning'}
            onClick={handleAction} disabled={actionLoading}>
            {actionLoading ? 'Processing...' : 'Confirm'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
