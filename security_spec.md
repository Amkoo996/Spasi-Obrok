# Security Spec

## Data Invariants
1. Offers must be created by a valid partner.
2. Orders must map to a valid offer, and have the correct partnerId.
3. Quantity must not be negative.
4. Users can only update orders to cancel them, or partners can update to picked_up/no_show.

## Dirty Dozen Payloads
1. Create offer with partnerId not matching uid. (Identity Spoof)
2. Create order for non-existent offer. (Orphaned Write)
3. Create order with negative quantity on offer (Sync Vulnerability).
4. Update order status skipping reserved.
5. Create order with someone else's userId.
6. Partner updating order they don't own.
7. Customer marking order as picked_up.
8. Customer updating offer.
9. Inject 1MB string into string fields.
10. Update locked fields.
11. Update timestamp mismatch.
12. Create user with role='admin'.

## Test Runner
TBD.
